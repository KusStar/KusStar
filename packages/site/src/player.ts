import YTPlayer from 'yt-player'

// // https://www.youtube.com/watch?v=jZDNMlqgcVY
const ID = '7jM2u-I6I2k'

export const player = new YTPlayer('#player', {
  width: 1,
  height: 1,
  controls: false,
  keyboard: false,
  fullscreen: true,
  annotations: false,
  modestBranding: false,
  host: 'https://www.youtube.com'
})

export const createPlayer = () => {
  player.load(ID)
  player.setVolume(100)

  const repeatChecker = setInterval(() => {
    player.play()
    if (player.getCurrentTime() > 0) {
      clearInterval(repeatChecker)
    }
  }, 500)

  return player
}
