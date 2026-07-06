setcpm(118/4)

$: s("bd ~ sd ~").bank("RolandTR808").gain(.85)

$: s("hh*8").gain("[.2 .12]*4").pan(.4)

$: note("c5 g4 a#4 g4").s("triangle")
  .lpf(2000).release(.2).delay(.35).room(.3).gain(.4)

$: note("c3 f3 a#2 g2").s("sawtooth")
  .lpf(3617).resonance(5).velocity(.4).release(.2).gain(.45)
