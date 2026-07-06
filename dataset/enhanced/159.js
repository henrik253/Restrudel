setcpm(120/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("hh*8").gain("[.2 .13]*4")

$: note("c4@2 a#3@2 d#4@2 g#3@2").s("sawtooth")
  .clip(.95).lpf(2200).release(.3).gain(.4)

$: n("<-2 0 2 3>").scale("c:minor").s("square")
  .lpf(1600).release(.2).room(.3).gain(.35)

$: n("<c2 g1 g#1 c2>").scale("c:minor").s("sawtooth")
  .lpf(600).release(.25).gain(.5)
