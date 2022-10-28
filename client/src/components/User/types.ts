export interface UserI {
  id: string
  name: string
  isAdmin: boolean
  tabs: Array<{
    id: number
    name: string
  }>
}
