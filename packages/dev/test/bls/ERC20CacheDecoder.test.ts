import { HttpProvider } from 'web3-core'
import { PrefixedHexString } from 'ethereumjs-util'

import { ERC20CacheDecoderInstance, TestTokenInstance } from '@opengsn/contracts'
import { CacheDecoderInteractor, CachingGasConstants } from '@opengsn/common/dist/bls/CacheDecoderInteractor'
import { ContractInteractor, GSNBatchingContractsDeployment } from '@opengsn/common'
import { Address, ObjectMap } from '@opengsn/common/dist/types/Aliases'

const TestToken = artifacts.require('TestToken')
const ERC20CacheDecoder = artifacts.require('ERC20CacheDecoder')

contract.only('ERC20CacheDecoder', function ([destination]: string[]) {
  let testToken: TestTokenInstance
  let erc20CacheDecoder: ERC20CacheDecoderInstance
  let cacheDecodersInteractor: CacheDecoderInteractor

  let erc20transferCalldata: PrefixedHexString
  let erc20rlpEncodedNewInput: PrefixedHexString

  const value = '111111'
  before(async function () {
    testToken = await TestToken.new()
    erc20CacheDecoder = await ERC20CacheDecoder.new()
    // @ts-ignore
    const batchingContractsDeployment: GSNBatchingContractsDeployment = {}
    const calldataDecoders: ObjectMap<Address> = {}
    calldataDecoders[testToken.address] = erc20CacheDecoder.address
    const cachingGasConstants: CachingGasConstants = {
      authorizationCalldataBytesLength: 1,
      authorizationStorageSlots: 1,
      gasPerSlotL2: 1
    }
    cacheDecodersInteractor = await new CacheDecoderInteractor({
      provider: web3.currentProvider as HttpProvider,
      batchingContractsDeployment,
      contractInteractor: {} as ContractInteractor,
      calldataCacheDecoderInteractors: {},
      cachingGasConstants
    })
      .init()
    erc20transferCalldata = testToken.contract.methods.transfer(destination, value).encodeABI()
    // TODO create erc20 decoder/interactor
    // ({ cachedEncodedData: erc20rlpEncodedNewInput } = await cacheDecodersInteractor.compressErc20Transfer(destination, value))
  })

  context('#convertAddressesToIds()', function () {})

  context('#decodeCalldata()', function () {
    it('should decode transfer() correctly with new input value', async function () {
      const res = await erc20CacheDecoder.decodeCalldata.call(erc20rlpEncodedNewInput)
      assert.equal(res, erc20transferCalldata)
    })

    it('should decode transfer() correctly with cached input value', async function () {
      // actually write values to cache
      await erc20CacheDecoder.decodeCalldata(erc20rlpEncodedNewInput)
      // create cached calldata rlp-encoding
      // TODO fix
      // const erc20rlpEncodedCached = await cacheDecodersInteractor.compressErc20Transfer(destination, value)
      // assert.equal(erc20rlpEncodedCached.cachedEncodedData.length, 16)
      // decode calldata using cache
      const res = await erc20CacheDecoder.decodeCalldata.call(erc20rlpEncodedNewInput)
      assert.equal(res, erc20transferCalldata)
    })

    it('should decode transferFrom() correctly with cached input value')
    it('should decode approve() correctly with cached input value')
    it('should decode permit() correctly with cached input value')
    it('should decode burn() correctly with cached input value')
    it('should decode mint() correctly with cached input value')
  })
})