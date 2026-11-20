import { reviewBoardCapabilities, reviewBoards, reviewTeamMemberships, reviewTeams, workspacePage } from '../resources/js/mocks/workspace.js'

const detailPath = /^\/(teams|boards)\/([A-Za-z\d_-]+)\/?$/u

export function isWorkspacePath(pathname) {
  return pathname === '/' || detailPath.test(pathname)
}

function projectNavigation(accountId) {
  const memberships = new Map(reviewTeamMemberships
    .filter(({ userId, canView }) => userId === accountId && canView)
    .map((membership) => [membership.teamId, membership]))

  const boardIds = new Set(reviewBoardCapabilities
    .filter(({ userId, canView }) => userId === accountId && canView)
    .map(({ boardId }) => boardId))

  return reviewTeams.filter((team) => memberships.has(team.id)).map((team) => {
    const { role, sidebarCollapsed } = memberships.get(team.id)
    return {
      ...team,
      url: `/teams/${team.id}`,
      membership: { role, sidebarCollapsed },
      capabilities: { canView: true },
      boards: reviewBoards
        .filter((board) => board.teamId === team.id && boardIds.has(board.id))
        .map((board) => ({ ...board, url: `/boards/${board.id}`, capabilities: { canView: true } })),
    }
  })
}

export function makeWorkspacePage(url, account) {
  const pathname = url.split(/[?#]/u, 1)[0]
  const match = pathname.match(detailPath)
  const teams = projectNavigation(account.id)
  const current = { view: 'overview', teamId: null, boardId: null }
  let component = workspacePage.component

  if (match) {
    const [, resource, id] = match
    const isTeamRoute = resource === 'teams'
    const team = isTeamRoute
      ? teams.find((team) => team.id === id)
      : teams.find((team) => team.boards.some((board) => board.id === id))

    if (team) {
      current.view = isTeamRoute ? 'team' : 'board'
      current.teamId = team.id
      current.boardId = isTeamRoute ? null : id
      component = isTeamRoute ? 'Workspace/Team' : 'Workspace/Board'
    } else {
      current.view = isTeamRoute ? 'unavailable-team' : 'unavailable-board'
      component = 'Workspace/Unavailable'
    }
  }

  return {
    ...workspacePage,
    component,
    url,
    props: {
      ...workspacePage.props,
      viewer: { id: account.id, name: account.name },
      navigation: { teams, current },
    },
  }
}
