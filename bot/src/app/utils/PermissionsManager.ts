import Manbo from 'manbo'

import BaseClient from '../structures/BaseClient'
import config from '../../config'

class PermissionsManager {
    public _client: BaseClient

    constructor(client: BaseClient) {
        this._client = client
    }

    isBotOwner(user: Manbo.User | Manbo.Member) {
        if (!user || !user.id) return false
        if (config.owners.includes(user.id)) return true
        else return false
    }

    isBotDeveloper(user: Manbo.User | Manbo.Member) {
        if (!user || !user.id) return false
        if (config.developers.includes(user.id)) return true
        else return false
    }

    isServerAdmin(member: Manbo.Member, channel: Manbo.GuildChannel) {
        if (!member) return false
        // let permissions = member.permissionsFor(channel);
        return member.id === channel.guild.ownerID || (member.permissions && (member.permissions.has('administrator') || member.permissions.has('manageGuild')))
    }

    /*

    isServerMod(member: Manbo.Member, channel: Manbo.GuildChannel) {
        // ignore DM
        if (!member || channel.type !== 0) return false

        const guildConfig = this._client.guilds.get(channel.guild.id)

        if (this.isBotOwner(member) || this.isServerAdmin(member, channel)) return true

        // server config may not have loaded yet
        if (!guildConfig) return false

        // check mod roles
        if (guildConfig.modRoles && member.roles && member.roles.find(r => guildConfig.modRoles.includes(r))) {
            return true
        }

        // sanity check
        if (!guildConfig.mods) return false

        return guildConfig.mods.includes(member.id)
    }

    canOverride(channel, member, command) {
        if (!member || !channel) return null

        const guildConfig = this._client.guilds.get(channel.guild.id)

        if (!guildConfig.permissions || !guildConfig.permissions.length) return null

        const channelPerms = guildConfig.channelPermissions
        const rolePerms = guildConfig.rolePermissions

        let canOverride = null

        if (channelPerms && channelPerms[channel.id] && channelPerms[channel.id].commands.hasOwnProperty(command)) {
            canOverride = channelPerms[channel.id].commands[command]
        }

        if (!rolePerms) return canOverride

        const roles = utils.sortRoles(channel.guild.roles)

        for (let role of roles) {
            if (!rolePerms[role.id]) continue
            if (member.roles.indexOf(role.id) === -1) continue

            if (rolePerms[role.id].commands.hasOwnProperty(command)) {
                canOverride = rolePerms[role.id].commands[command]
                break
            }
        }

        return canOverride
    }

    */
}
