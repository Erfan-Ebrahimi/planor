import { byPosition, priorities } from '../resources/js/lib/board.js'
import { dateReview } from '../resources/js/mocks/dates.js'
import { reviewBoards, reviewTeamMemberships, reviewTeams, workspacePage } from '../resources/js/mocks/workspace.js'
import { boardPermissions, createBoardHarness } from './boards.js'

const detailPath = /^\/(teams|boards|cards)\/([A-Za-z\d_-]+)\/?$/u
const dateReviewPath = /^\/review\/jalali\/?$/u

export function isWorkspacePath(pathname) {
  return pathname === '/' || detailPath.test(pathname) || dateReviewPath.test(pathname)
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

function projectBoard(content, board, selectedCard) {
  const actionUrl = `${board.url}/manage`
  return {
    id: board.id,
    url: board.url,
    actionUrl,
    capabilities: board.capabilities,
    members: content.members,
    labels: content.labels,
    priorities,
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
        url: `/cards/${card.id}`,
      })),
    })),
    selectedCard: selectedCard ? { ...selectedCard, checklist: byPosition(selectedCard.checklist) } : null,
  }
}

export function makeWorkspacePage(url, account, boardStore = createBoardHarness(), errors = {}) {
  const pathname = url.split(/[?#]/u, 1)[0]
  const match = pathname.match(detailPath)
  const teams = projectNavigation(account.id, boardStore)
  const current = { view: 'overview', teamId: null, boardId: null }
  let component = workspacePage.component
  let boardWorkspace

  if (dateReviewPath.test(pathname)) {
    current.view = 'date-review'
    component = 'Workspace/DateReview'
  } else if (match) {
    const [, resource, id] = match
    const boards = teams.flatMap((team) => team.boards)
    const board = resource === 'boards'
      ? boards.find((board) => board.id === id)
      : resource === 'cards' && boards.find((board) => boardStore.read(account.id, board.id).cards.some((card) => card.id === id))
    const team = teams.find((team) => team.id === (resource === 'teams' ? id : board?.teamId))

    if (board) {
      current.view = 'board'
      current.teamId = board.teamId
      current.boardId = board.id
      component = 'Workspace/Board'
      const content = boardStore.read(account.id, board.id)
      const selectedCard = resource === 'cards' && content.cards.find((card) => card.id === id)
      boardWorkspace = projectBoard(content, board, selectedCard)
    } else if (team) {
      current.view = 'team'
      current.teamId = team.id
      component = 'Workspace/Team'
    } else {
      current.view = `unavailable-${{ teams: 'team', boards: 'board', cards: 'card' }[resource]}`
      component = 'Workspace/Unavailable'
    }
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
      workspaceRevision: boardStore.revision(account.id),
      ...(boardWorkspace ? { boardWorkspace } : {}),
      ...(current.view === 'date-review' ? dateReview : {}),
    },
  }
}
