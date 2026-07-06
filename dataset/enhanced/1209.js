setcpm(124/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("~ ~ ~ cymbal").gain(.3)

$: s("hh*8").gain("[.2 .13]*4").pan(.45)

$: n("2 1 2 1").scale("a:minor").s("sawtooth")
  .gain("<.4 .35 .3>").lpf(2000).resonance(5).release(.15).delay(.35)

$: note("e5 ~ c5 ~").s("triangle")
  .lpf(2500).release(.3).room(.4).gain(.3)

$: note("<a1 a1 e2 c2>").s("square")
  .lpf(600).release(.2).gain(.5)
