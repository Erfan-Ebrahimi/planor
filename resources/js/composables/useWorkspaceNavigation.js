import { computed, ref, watch } from 'vue'

export const workspaceFilterKey = Symbol('workspaceFilter')

function normalizeName(value) {
  return value.normalize('NFKC')
    .replace(/[يى]/gu, 'ی')
    .replace(/ك/gu, 'ک')
    .replace(/[\s\u200c]+/gu, ' ')
    .trim()
    .toLocaleLowerCase('fa')
}

export function filterWorkspaceTeams(teams, scope, query) {
  const term = normalizeName(query)
  if (!term) return teams
  const matches = (name) => normalizeName(name).includes(term)

  if (scope === 'teams') return teams.filter((team) => matches(team.name))

  return teams
    .map((team) => ({ ...team, boards: team.boards.filter((board) => matches(board.name)) }))
    .filter((team) => team.boards.length)
}

export function useWorkspaceNavigation(getNavigation) {
  const current = computed(() => getNavigation().current)
  const teams = computed(() => getNavigation().teams)
  const scope = ref(current.value.view === 'team' ? 'boards' : 'teams')
  const query = ref('')
  const expandedById = ref({})
  const visibleTeams = computed(() => filterWorkspaceTeams(teams.value, scope.value, query.value))
  const isFiltered = computed(() => Boolean(normalizeName(query.value)))

  watch([() => current.value.view, () => current.value.teamId], ([view]) => {
    if (view !== 'overview' && view !== 'team') return
    query.value = ''
    scope.value = view === 'team' ? 'boards' : 'teams'
  })

  const sidebarTeams = computed(() => visibleTeams.value.map((team) => {
    const forcedOpen = team.id === current.value.teamId || (scope.value === 'boards' && isFiltered.value)
    const expanded = Boolean(team.boards.length) && (
      forcedOpen || (expandedById.value[team.id] ?? !team.membership.sidebarCollapsed)
    )

    return { ...team, expanded, canToggle: Boolean(team.boards.length) && !forcedOpen }
  }))

  function toggleTeam(teamId) {
    const team = sidebarTeams.value.find((item) => item.id === teamId)
    if (team?.canToggle) expandedById.value[teamId] = !team.expanded
  }

  return { query, scope, visibleTeams, isFiltered, sidebarTeams, toggleTeam }
}
