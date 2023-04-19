import cluster from 'cluster'
import path from 'path'

async function assignWorkerInfo(info) {
  if (info.type !== 'startup') {
    cluster.worker!.once('message', assignWorkerInfo)
    return
  }

  if (info.processType === 'bot') {
    // @ts-ignore
    Object.assign(cluster.worker, info)
    require(path.resolve('dist', 'src', 'app', 'index'))
  }
}

cluster.worker!.once('message', assignWorkerInfo)
