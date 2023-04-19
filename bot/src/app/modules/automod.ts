import i18next from 'i18next'
import Manbo from 'manbo'
import {request} from 'undici'

async function antiFhishing(message: Manbo.Message<Manbo.TextChannel | Manbo.ThreadChannel | Manbo.TextVoiceChannel>, lang: string) {
    if (!message.guildID) false
    
    // if all automod feature is on
    // add exclude role/channel later one, just a working feature rn
    if (message.member!.permissions.has(Manbo.Constants.Permissions.manageGuild | Manbo.Constants.Permissions.administrator))
        // false for automod excape
        return false

    const checkIfScam = await hasPhishingLink(message.content)
    if (checkIfScam) {

    }
}

async function hasPhishingLink(string: string): Promise<boolean> {
    // match URLs in string
    const regex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig
    const URLs = string.match(regex)
    if (!URLs)
    return false // return when url doesnt exist in string
    for (let url of URLs) {
        const domain = (new URL(url)).hostname
        const {body} = await request(`https://phish.sinking.yachts/v2/check/${domain}`)
        const res = await body.json()
        if (res)
        return true
    }
    return false
}

async function automodAction(message: Manbo.Message<Manbo.TextChannel | Manbo.ThreadChannel | Manbo.TextVoiceChannel>, lang: string) {
    // later on add actions with can be configured with dashboard
    // now i will just add message delete
    message.delete().catch(async () => {
        await message.channel.createMessage({
            // replace this message with custom text via dashboard settings
            content: `${i18next.t(`automod.phishing.del_msg_error`, {ns: 'translations', lng: lang})}`,
            messageReference: {
                messageID: message.id
            }
        }).catch(()=>{})
    })
}