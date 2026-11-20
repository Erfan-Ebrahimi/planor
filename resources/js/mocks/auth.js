import { workspacePage } from './workspace.js'

export const reviewAccount = {
  ...workspacePage.props.viewer,
  email: 'niloufar.rastegar@example.com',
  username: 'n.rastegar',
  password: 'Rastegar-Review-42!',
}

export const reviewSignup = {
  id: 'usr-1008',
  name: 'بهار نادری',
  email: 'bahar.naderi@example.net',
  username: 'b.naderi',
  password: 'Bahar-Review-48!',
}

export const reviewCollaborator = {
  id: 'usr-1011',
  name: 'کامران یوسفی',
  email: 'kamran.yousefi@example.org',
  username: 'k.yousefi',
  password: 'Yousefi-Review-57!',
}
