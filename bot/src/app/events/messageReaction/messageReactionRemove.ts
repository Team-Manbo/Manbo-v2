import Manbo from 'manbo'
import cluster from 'cluster'
import { send } from '../../../miscellaneous/WebsocketClient'
import { sleep } from '../../utils/utils'
import { ExtendedWorker } from '../../../../typings'

export = {
  name: 'messageReactionRemove',
  type: 'on',
  handle: async (message: Manbo.Message, emoji: Manbo.Emoji, userID: string) => {
    console.log(emoji)
  },
}
