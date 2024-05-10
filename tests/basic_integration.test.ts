/** ******************************************************************************
 *  (c) 2018 - 2022 Zondax AG
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 ******************************************************************************* */

import TransportNodeHid from '@ledgerhq/hw-transport-node-hid'
import { ThorchainApp } from '../src/thorchainApp'
import { ERROR_CODE } from '../src/common'

//@ts-ignore
import secp256k1 from 'secp256k1/elliptic'
//@ts-ignore
import crypto from 'crypto'

let transport = {}
jest.setTimeout(120000)

beforeAll(async () => {
  transport = await TransportNodeHid.create(1000)
})

describe('Integration', function () {
  test('get version', async () => {
    const app = new ThorchainApp(transport)
    const resp = await app.getVersion()
    console.log(resp)

    expect(resp.return_code).toEqual(ERROR_CODE.NoError)
    expect(resp.error_message).toEqual('No errors')
    expect(resp).toHaveProperty('test_mode')
    expect(resp).toHaveProperty('major')
    expect(resp).toHaveProperty('minor')
    expect(resp).toHaveProperty('patch')
    expect(resp.test_mode).toEqual(false)
  })

  test('publicKey', async () => {
    const app = new ThorchainApp(transport)

    // Derivation path. First 3 items are automatically hardened!
    const path = [44, 931, 0, 0, 0]

    const resp = await app.publicKey(path)

    expect(resp.return_code).toEqual(ERROR_CODE.NoError)
    expect(resp.error_message).toEqual('No errors')
    expect(resp).toHaveProperty('compressed_pk')
    expect(resp.compressed_pk.length).toEqual(33)
  })

  test('getAddressAndPubKey', async () => {
    const app = new ThorchainApp(transport)

    // Derivation path. First 3 items are automatically hardened!
    const path = [44, 931, 5, 0, 3]
    const resp = await app.getAddressAndPubKey(path, 'thor')

    console.log(resp)

    expect(resp.return_code).toEqual(ERROR_CODE.NoError)
    expect(resp.error_message).toEqual('No errors')

    expect(resp).toHaveProperty('bech32_address')
    expect(resp).toHaveProperty('compressed_pk')

    expect(resp.compressed_pk.length).toEqual(33)
  })

  test('showAddressAndPubKey', async () => {
    jest.setTimeout(60000)
    const app = new ThorchainApp(transport)

    // Derivation path. First 3 items are automatically hardened!
    const path = [44, 931, 5, 0, 3]
    const resp = await app.showAddressAndPubKey(path, 'thor')

    console.log(resp)

    expect(resp.return_code).toEqual(ERROR_CODE.NoError)
    expect(resp.error_message).toEqual('No errors')

    expect(resp).toHaveProperty('bech32_address')
    expect(resp).toHaveProperty('compressed_pk')

    expect(resp.compressed_pk.length).toEqual(33)
  })

  test('appInfo', async () => {
    const app = new ThorchainApp(transport)
    const resp = await app.appInfo()

    console.log(resp)

    expect(resp.return_code).toEqual(ERROR_CODE.NoError)
    expect(resp.error_message).toEqual('No errors')

    expect(resp).toHaveProperty('appName')
    expect(resp).toHaveProperty('appVersion')
    expect(resp).toHaveProperty('flagLen')
    expect(resp).toHaveProperty('flagsValue')
    expect(resp).toHaveProperty('flag_recovery')
    expect(resp).toHaveProperty('flag_signed_mcu_code')
    expect(resp).toHaveProperty('flag_onboarded')
    expect(resp).toHaveProperty('flag_pin_validated')
  })

  test('deviceInfo', async () => {
    const app = new ThorchainApp(transport)

    const resp = await app.deviceInfo()

    console.log(resp)

    expect(resp.return_code).toEqual(ERROR_CODE.NoError)
    expect(resp.error_message).toEqual('No errors')

    expect(resp).toHaveProperty('targetId')
    expect(resp).toHaveProperty('seVersion')
    expect(resp).toHaveProperty('flag')
    expect(resp).toHaveProperty('mcuVersion')
  })

  test('sign_msg_send', async () => {
    const app = new ThorchainApp(transport)

    // Derivation path. First 3 items are automatically hardened!
    const path = [44, 931, 0, 0, 0]
    const message = Buffer.from(String.raw`{"account_number":"588","chain_id":"thorchain","fee":{"amount":[],"gas":"2000000"},"memo":"TestMemo","msgs":[{"type":"thorchain/MsgSend","value":{"amount":[{"amount":"150000000","denom":"rune"}],"from_address":"tthor1c648xgpter9xffhmcqvs7lzd7hxh0prgv5t5gp","to_address":"tthor10xgrknu44d83qr4s4uw56cqxg0hsev5e68lc9z"}}],"sequence":"5"}`, 'utf8')
    const responsePk = await app.publicKey(path)
    console.log(responsePk)
    expect(responsePk.return_code).toEqual(ERROR_CODE.NoError)
    expect(responsePk.error_message).toEqual('No errors')

    const responseSign = await app.sign(path, message)
    console.log(responseSign)

    expect(responseSign.return_code).toEqual(ERROR_CODE.NoError)
    expect(responseSign.error_message).toEqual('No errors')

    // Now verify the signature
    const hash = crypto.createHash('sha256')
    const msgHash = Uint8Array.from(hash.update(message).digest())

    const signatureDER = responseSign.signature
    const signature = secp256k1.signatureImport(Uint8Array.from(signatureDER))

    const pk = Uint8Array.from(responsePk.compressed_pk)

    const signatureOk = secp256k1.ecdsaVerify(signature, msgHash, pk)
    expect(signatureOk).toEqual(true)
  })

  test('sign_msg_deposit', async () => {
    jest.setTimeout(60000)
    const app = new ThorchainApp(transport)

    // Derivation path. First 3 items are automatically hardened!
    const path = [44, 931, 0, 0, 0]
    const message = Buffer.from(String.raw`{"account_number":"588","chain_id":"thorchain","fee":{"amount":[],"gas":"10000000"},"memo":"","msgs":[{"type":"thorchain/MsgDeposit","value":{"coins":[{"amount":"330000000","asset":"THOR.RUNE"}],"memo":"SWAP:BNB.BNB:tbnb1qk2m905ypazwfau9cn0qnr4c4yxz63v9u9md20:","signer":"tthor1c648xgpter9xffhmcqvs7lzd7hxh0prgv5t5gp"}}],"sequence":"6"}`, 'utf-8')

    const responsePk = await app.publicKey(path)
    const responseSign = await app.sign(path, message)

    console.log(responsePk)
    console.log(responseSign)

    expect(responsePk.return_code).toEqual(ERROR_CODE.NoError)
    expect(responsePk.error_message).toEqual('No errors')
    expect(responseSign.return_code).toEqual(ERROR_CODE.NoError)
    expect(responseSign.error_message).toEqual('No errors')

    // Now verify the signature
    const hash = crypto.createHash('sha256')
    const msgHash = Uint8Array.from(hash.update(message).digest())

    const signatureDER = responseSign.signature
    const signature = secp256k1.signatureImport(Uint8Array.from(signatureDER))

    const pk = Uint8Array.from(responsePk.compressed_pk)

    const signatureOk = secp256k1.ecdsaVerify(signature, msgHash, pk)
    expect(signatureOk).toEqual(true)
  })

  test('sign_msg_send_empty_memo', async () => {
    jest.setTimeout(60000)
    const app = new ThorchainApp(transport)

    // Derivation path. First 3 items are automatically hardened!
    const path = [44, 931, 0, 0, 0]
    const message = Buffer.from(String.raw`{"account_number":"588","chain_id":"thorchain","fee":{"amount":[],"gas":"2000000"},"memo":"","msgs":[{"type":"thorchain/MsgSend","value":{"amount":[{"amount":"150000000","denom":"rune"}],"from_address":"tthor1c648xgpter9xffhmcqvs7lzd7hxh0prgv5t5gp","to_address":"tthor10xgrknu44d83qr4s4uw56cqxg0hsev5e68lc9z"}}],"sequence":"5"}`, 'utf-8')

    const responsePk = await app.publicKey(path)
    const responseSign = await app.sign(path, message)

    console.log(responsePk)
    console.log(responseSign)

    expect(responsePk.return_code).toEqual(ERROR_CODE.NoError)
    expect(responsePk.error_message).toEqual('No errors')
    expect(responseSign.return_code).toEqual(ERROR_CODE.NoError)
    expect(responseSign.error_message).toEqual('No errors')

    // Now verify the signature
    const hash = crypto.createHash('sha256')
    const msgHash = Uint8Array.from(hash.update(message).digest())

    const signatureDER = responseSign.signature
    const signature = secp256k1.signatureImport(Uint8Array.from(signatureDER))

    const pk = Uint8Array.from(responsePk.compressed_pk)

    const signatureOk = secp256k1.ecdsaVerify(signature, msgHash, pk)
    expect(signatureOk).toEqual(true)
  })
})
