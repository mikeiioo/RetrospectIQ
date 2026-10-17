import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ObjectId } from 'mongodb'

const db = vi.hoisted(() => ({
  findOne: vi.fn(),
  find: vi.fn(),
  insertOne: vi.fn(),
}))

vi.mock('./mongodb', () => ({
  getDb: async () => ({ collection: () => db }),
}))

import { createPermit, getPermit, getPermitById, listPermits } from './permits'

const id = new ObjectId()

function permitDoc(ownerId: string) {
  return {
    _id: id,
    ownerId,
    buildingName: 'Test',
    address: '1 Main St',
    s3Key: 'permits/x.pdf',
    originalFilename: 'x.pdf',
    sizeBytes: 10,
    contentType: 'application/pdf',
    uploadedAt: new Date('2026-01-01T00:00:00Z'),
    status: 'uploaded' as const,
  }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('permit ownership scoping', () => {
  it('getPermit filters by both id and owner', async () => {
    db.findOne.mockResolvedValue(null)
    await getPermit(id.toString(), 'user-a')
    expect(db.findOne).toHaveBeenCalledWith({ _id: id, ownerId: 'user-a' })
  })

  it("getPermit returns null for another user's permit", async () => {
    // The owner filter makes MongoDB return nothing for a non-owner.
    db.findOne.mockResolvedValue(null)
    expect(await getPermit(id.toString(), 'user-b')).toBeNull()
  })

  it('getPermit returns the view without exposing ownerId', async () => {
    db.findOne.mockResolvedValue(permitDoc('user-a'))
    const view = await getPermit(id.toString(), 'user-a')
    expect(view?.id).toBe(id.toString())
    expect(view).not.toHaveProperty('ownerId')
  })

  it('getPermit rejects malformed ids without querying', async () => {
    expect(await getPermit('not-an-id', 'user-a')).toBeNull()
    expect(db.findOne).not.toHaveBeenCalled()
  })

  it('listPermits only queries the owner’s permits', async () => {
    const sort = vi.fn(() => ({ toArray: async () => [permitDoc('user-a')] }))
    db.find.mockReturnValue({ sort })
    const permits = await listPermits('user-a')
    expect(db.find).toHaveBeenCalledWith({ ownerId: 'user-a' })
    expect(sort).toHaveBeenCalledWith({ uploadedAt: -1 })
    expect(permits).toHaveLength(1)
  })

  it('createPermit stores the owner', async () => {
    db.insertOne.mockResolvedValue({ insertedId: id })
    await createPermit({
      ownerId: 'user-a',
      buildingName: 'Test',
      address: '1 Main St',
      s3Key: 'permits/x.pdf',
      originalFilename: 'x.pdf',
      sizeBytes: 10,
      contentType: 'application/pdf',
    })
    expect(db.insertOne).toHaveBeenCalledWith(
      expect.objectContaining({ ownerId: 'user-a', status: 'uploaded' }),
    )
  })

  it('getPermitById (pipeline only) does not filter by owner', async () => {
    db.findOne.mockResolvedValue(null)
    await getPermitById(id.toString())
    expect(db.findOne).toHaveBeenCalledWith({ _id: id })
  })
})
