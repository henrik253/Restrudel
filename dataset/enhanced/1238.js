setcpm(114/4)

$: s("bd ~ sd ~").bank("LinnDrum").gain(.82)

$: s("hh*8").gain("[.2 .12]*4").pan(.4)

$: note("c2 g2 c3 g2").s("gm_contrabass")
  .lpf(1000).release(.25).gain(.45)

$: note("c4 e4 g4 e4").s("triangle")
  .lpf(2000).release(.2).delay(.35).gain(.4)

$: note("<c2 c2 g1 a1>").s("sawtooth")
  .lpf(600).release(.2).gain(.5)
