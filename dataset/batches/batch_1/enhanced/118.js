setcpm(120/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("oh ~ oh ~").bank("RolandTR909").gain(.3)

$: s("hh*8").gain("[.2 .14]*4").pan(.5)

$: note("e4 d4 e4 g4").s("sawtooth")
  .clip(.9).lpf(2200).resonance(6).release(.2).delay(.3).gain(.4)

$: note("~ e2 ~ e1").s("square").struct("<x ~ ~ x>*4").lpf(600).release(.2).gain(.5)
