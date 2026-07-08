setcpm(120/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("hh*8").gain("[.2 .12]*4")

$: note("b4 c5 e5 c5 b4 a4 b4 c5 e5 c5 b4 a4 b4 c5 e5 c5").s("triangle")
  .lpf(3200).gain("<0.35 0.2>").release(.2).room(.3)

$: n("<g1 d2 c2 a1>").scale("g:dorian").s("sawtooth")
  .lpf(600).release(.3).gain(.5)
