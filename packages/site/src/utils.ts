import { animate, AnimationOptions } from 'popmotion'

export const animateChain = (opt: AnimationOptions<number>) => {
  return new Promise<any>((resolve) => {
    animate({
      ...opt,
      onComplete: () => resolve(true),
      onStop: () => resolve(false)
    })
  })
}
