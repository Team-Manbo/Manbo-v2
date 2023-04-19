import Manbo from 'manbo'
import i18next from 'i18next'
import { checkBasic, getDispatcher } from '../../utils/audio'
import { ExtendedTrack } from '../../../../typings'

export = {
    func: async function (message: Manbo.Message<Manbo.TextChannel | Manbo.ThreadChannel | Manbo.TextVoiceChannel>, suffix: Array<string>, language: string) {
        const basicCheck = checkBasic(message.member, language)
        if (typeof basicCheck === 'string')
            return message.channel.createMessage({
                content: `${basicCheck}`,
            })
        const dispatcher = getDispatcher(message.guildID, language)
        if (typeof dispatcher === 'string')
            return message.channel.createMessage({
                content: `${dispatcher}`,
            })
        
        dispatcher.queue = dispatcher.queue.sort(() => Math.random() - 0.5)
        dispatcher.queue = balancedShuffle(dispatcher.queue)
         
        return message.channel.createMessage({
            content: `${i18next.t(`${this.type}.${this.name}.shuffled`, { ns: 'commands', lng: language })}`,
        })
    },
    name: 'shuffle',
    description: 'shuffle',
    type: 'music',
    onlyCmdChannel: true,
}


function balancedShuffle(someArray: ExtendedTrack[]): ExtendedTrack[] {
    const obj = {}
    for (const ele of someArray) {
        if (ele.requester.username in obj) {
            obj[ele.requester.username].push(ele)
        } else {
            obj[ele.requester.username] = [ele]
        }
    }
    const nestedArray: any = Object.entries(obj)
    // nestedArray.sort((a, b) => a[0].localeCompare(b[0]));
    const resultArray: ExtendedTrack[] = []
    while (nestedArray.length > 0) {
        for (let i = 0; i < nestedArray.length; i++) {
            resultArray.push(nestedArray[i][1].shift())
            if (nestedArray[i][1].length === 0) {
                nestedArray.splice(i, 1)
                i--
            }
        }
    }
    return resultArray
}
