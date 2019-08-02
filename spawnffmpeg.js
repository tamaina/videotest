const { execFile } = require('child_process')
const getD = require('get-video-dimensions')

const settings = [
  {
    shortL: 1080,
    args: "-c:v:%n libvpx-vp9 -b:v:%n 2000k -c:a:%n libopus -b:a:%n 128k -threads:v:%n 1 -quality:v:%n realtime -speed:v:%n 10 -keyint_min:v:%n 120 -g:v:%n 120"
  },
  {
    shortL: 720,
    args: "-c:v:%n libvpx-vp9 -b:v:%n 1000k -c:a:%n libopus -b:a:%n 128k -threads:v:%n 1 -quality:v:%n realtime -speed:v:%n 4 -keyint_min:v:%n 120 -g:v:%n 120"
  },
  {
    shortL: 540,
    args: "-c:v:%n libx264 -b:v:%n 400k -c:a:%n aac -b:a:%n 128k -threads:v:%n 1 -quality:v:%n realtime -speed:v:%n 4 -keyint_min:v:%n 120 -g:v:%n 120"
  },
  {
    shortL: 180,
    args: "-c:v:%n libvpx-vp9 -b:v:%n 150k -c:a:%n libopus -b:a:%n 96k -threads:v:%n 1 -quality:v:%n realtime -speed:v:%n 4 -keyint_min:v:%n 120 -g:v:%n 120"
  }
]

const path = 'monorail.mp4';

(async function() {
  const d = await getD(path)
  console.log(d)
  const minL = Math.min(d.width, d.height)

  let args = ['-i', path]
  let cnt = 0

  for (let i = 0; i < settings.length; i += 1) {
    const setting = settings[i]
    if (minL < setting.shortL) continue
    args.push(...[`-filter:v:${cnt}`, `scale=if(lt(iw\\,ih)\\,${setting.shortL}\\,-2):if(lt(ih\\,iw)\\,${setting.shortL}\\,-2)`, ...setting.args.replace(/%n/g, cnt).split(' ')])
    cnt += 1
  }

  for (let i = 0; i < cnt; i += 1) {
    args.push('-map', '0')
  }

  args.push(...[
    '-f', 'dash',
    '-init_seg_name', 'mono-init-s$RepresentationID$.$ext$',
    '-media_seg_name', 'mono-chunk-s$RepresentationID$-$Number%05d$.$ext$',
    '-adaptation_sets', 'id=0,streams=v id=1,streams=a',
    '-use_template', '1',
    '-use_timeline', '0',
    'mono.mpd'
  ])

  console.log(args)

  await new Promise((res, rej) => {
    execFile('ffmpeg', args, (err, stdout, strerr) => {
      if (err) rej(err)
      res(stdout)
    })
  }).then(() => {
    console.log('Success')
  }).catch((e) => {
    console.error(e)
  })
  return;
})()
