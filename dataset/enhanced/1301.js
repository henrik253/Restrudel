setcpm(128/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("hh*4").gain(.2)

$: n("-3 ~ -4 ~ -5 ~ -6 -5 -7@3 ~ 0 1 2 3").scale("g:dorian").s("sawtooth")
  .lpf(1400).resonance(6).release(.15).gain(.45)

$: n("<-7 -3 0 -5>").scale("g:dorian").s("square")
  .lpf(700).release(.3).gain(.5)
