import fa from '../resources/js/lang/fa.js'
import { byPosition, priorities } from '../resources/js/lib/board.js'
import { dateReview } from '../resources/js/mocks/dates.js'
import { reviewBoards, reviewTeamMemberships, reviewTeams, workspacePage } from '../resources/js/mocks/workspace.js'
import { boardPermissions, createBoardHarness } from './boards.js'
import { archiveFor, projectArchive } from './archive.js'
import { cardFiles, projectFiles } from './attachments.js'
import { cardComments, projectComments } from './comments.js'
import { projectActivity } from './events.js'

const detailPath = /^\/(teams|boards|cards)\/([A-Za-z\d_-]+)\/?$/u
const dateReviewPath = /^\/review\/jalali\/?$/u
const archivePath = /^\/boards\/([A-Za-z\d_-]+)\/archive\/?$/u

export function isWorkspacePath(pathname) {
  return pathname === '/' || pathname === '/notifications' || detailPath.test(pathname) || dateReviewPath.test(pathname) || archivePath.test(pathname)
}

function projectNavigation(accountId, boardStore) {
  const memberships = new Map(reviewTeamMemberships
    .filter(({ userId, canView }) => userId === accountId && canView)
    .map((membership) => [membership.teamId, membership]))

  return reviewTeams.filter((team) => memberships.has(team.id)).map((team) => {
    const { role, sidebarCollapsed } = memberships.get(team.id)
    return {
      ...team,
      url: `/teams/${team.id}`,
      membership: { role, sidebarCollapsed },
      capabilities: { canView: true },
      boards: reviewBoards
        .filter((board) => board.teamId === team.id && boardPermissions(accountId, board.id).canView)
        .map((board) => {
          const { cards } = boardStore.read(accountId, board.id)
          return {
            ...board,
            url: `/boards/${board.id}`,
            cardCount: cards.length,
            taskCount: cards.reduce((total, card) => total + card.checklist.length, 0),
            capabilities: boardPermissions(accountId, board.id),
          }
        }),
    }
  })
}

function projectBoard(content, board, selectedCard, viewerId) {
  const actionUrl = `${board.url}/manage`
  return {
    id: board.id,
    url: board.url,
    actionUrl,
    capabilities: board.capabilities,
    archiveUrl: board.url + '/archive',
    archiveCount: archiveFor(content, board.id).length,
    members: content.members,
    labels: content.labels,
    priorities,
    activity: projectActivity(content, board.id),
    lists: byPosition(content.lists).map((list) => ({
      ...list,
      cards: byPosition(content.cards.filter(({ listId }) => listId === list.id)).map((card) => ({
        id: card.id,
        listId: card.listId,
        position: card.position,
        title: card.title,
        completed: card.completed,
        priority: card.priority,
        assigneeId: card.assigneeId,
        labelIds: card.labelIds,
        dueAt: card.dueAt,
        hasDescription: Boolean(card.description),
        taskCount: card.checklist.length,
        completedTaskCount: card.checklist.filter((task) => task.completed).length,
        attachmentCount: cardFiles(card).length,
        commentCount: cardComments(card).length,
        url: `/cards/${card.id}`,
      })),
    })),
    selectedCard: selectedCard ? {
      ...selectedCard,
      checklist: byPosition(selectedCard.checklist),
      attachments: projectFiles(selectedCard, content.members),
      comments: projectComments(selectedCard, content.members, viewerId, board.capabilities.canComment),
      activity: projectActivity(content, board.id, selectedCard.id),
    } : null,
  }
}

export function makeWorkspacePage(url, account, boardStore = createBoardHarness(), errors = {}) {
  const pathname = url.split(/[?#]/u, 1)[0]
  const match = pathname.match(detailPath)
  const archiveMatch = pathname.match(archivePath)
  const teams = projectNavigation(account.id, boardStore)
  const current = { view: 'overview', teamId: null, boardId: null }
  let component = workspacePage.component
  let boardWorkspace
  let archiveWorkspace
  let archivedCard

  if (dateReviewPath.test(pathname)) {
    current.view = 'date-review'
    component = 'Workspace/DateReview'
  } else if (pathname === '/notifications') {
    current.view = 'notifications'
    component = 'Workspace/Notifications'
  } else if (match || archiveMatch) {
    const [, resource, id] = match ?? [null, 'boards', archiveMatch[1]]
    const boards = teams.flatMap((team) => team.boards)
    const board = resource === 'boards'
      ? boards.find((board) => board.id === id)
      : resource === 'cards' && boards.find((board) => boardStore.read(account.id, board.id).cards.some((card) => card.id === id))
    const team = teams.find((team) => team.id === (resource === 'teams' ? id : board?.teamId))

    if (board) {
      current.view = 'board'
      current.teamId = board.teamId
      current.boardId = board.id
      const content = boardStore.read(account.id, board.id)
      if (archiveMatch) {
        component = 'Workspace/Archive'
        archiveWorkspace = { boardName: board.name, boardUrl: board.url, ...projectArchive(content, board.id, board.capabilities) }
      } else {
        component = 'Workspace/Board'
        const selectedCard = resource === 'cards' && content.cards.find((card) => card.id === id)
        boardWorkspace = projectBoard(content, board, selectedCard, account.id)
      }
    } else if (team) {
      current.view = 'team'
      current.teamId = team.id
      component = 'Workspace/Team'
    } else {
      current.view = `unavailable-${{ teams: 'team', boards: 'board', cards: 'card' }[resource]}`
      component = 'Workspace/Unavailable'
      if (resource === 'cards') {
        for (const scope of boards) {
          const entry = archiveFor(boardStore.read(account.id, scope.id), scope.id).find(({ card }) => card.id === id)
          if (!entry) continue
          archivedCard = { title: entry.card.title, archiveUrl: scope.url + '/archive' }
          Object.assign(current, { view: 'archived-card', teamId: scope.teamId, boardId: scope.id })
          break
        }
      }
    }
  } else if (pathname !== '/') {
    current.view = 'not-found'
    component = 'Workspace/Unavailable'
  }

  return {
    ...workspacePage,
    component,
    url,
    props: {
      ...workspacePage.props,
      errors,
      viewer: { id: account.id, name: account.name },
      navigation: { teams, current },
      workspaceRevision: boardStore.revision(),
      storageWarning: boardStore.isVolatile() ? fa.common.volatile : '',
      notifications: boardStore.inbox(account.id),
      ...(boardWorkspace ? { boardWorkspace } : {}),
      ...(archiveWorkspace ? { archiveWorkspace } : {}),
      ...(archivedCard ? { archivedCard } : {}),
      ...(current.view === 'date-review' ? dateReview : {}),
    },
  }
}
