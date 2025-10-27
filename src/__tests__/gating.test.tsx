import { describe, it, expect, vi } from 'vitest'
import { useStore } from '../app/store'

// happy-path smoke test for tutorial gating based on rank or verified gym

describe('tutorial gating', () => {
  it('prevents tutorial post for unverified low-rank user', () => {
    const state = useStore.getState()
    const user = state.users[0]
    state.updateUser(user.id, { verifiedGym: false, rankLevel: 1 })
    // try to add a tutorial
    const addSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
    state.addPost(user.id, 'Test tutorial', 'tutorial')
    expect(addSpy).toHaveBeenCalled()
    addSpy.mockRestore()
  })
})
