setcpm(118/4)

$: s("bd ~ sd ~").bank("RolandTR808").gain(.85)

$: s("~ cp ~ ~").gain(.3)

$: note("g2 d#2 f2@3 ~ c2*8 a2").s("sawtooth")
  .lpf(900).room(.5).release(.2).gain(.5)

$: note("g#4@2 ~ f#4").s("square")
  .struct("x*8").velocity(.5).lpf(2400).release(.15).gain(.35)
