import { RequestHandler } from 'express'
import { endpoint } from '../functions/endpoint'
import { HttpError } from '../utils/httpError'

import Docker from 'dockerode'
const dockerController = new Docker({ socketPath: '/var/run/docker.sock' })

export const docker = endpoint(async (req, res) => {
  global.logger.info(`endpoint 'docker' called`)
  global.webhook.custom({ title: 'Endpoint Called', description: `Endpoint \`docker\` called` })
  let status
  try {
    status = 'success'
    const dockerToStop = dockerController.getContainer(req.query.uuid === 'no1' ? 'bot1' : 'bot2')
    // dockerToStop.exec({ Cmd: 'process.exit(0)' })
    dockerToStop.stop()
    global.logger.info(`killing docker container: ${req.query.uuid}`)
    global.webhook.custom({ title: `processing docker stop...`, description: `killing docker container: ${req.query.uuid}` })
  } catch (err) {
    status = 'fail'
    global.logger.warn(`failed to top container ${req.query.uiud}, please manually stop it.`)
    global.webhook.custom({ title: `stop failed.`, description: `failed to top container ${req.query.uiud}, please manually stop it.` })
  }

  res.status(200).json({
    container: `${req.query.uuid}`,
    status: `${status}`,
  })
})
