setcpm(128/4)

$: s("bd*4").bank("RolandTR909").gain(.82).hpf(200)

$: s("~ cp ~ cp").bank("RolandTR909").gain(.55)

$: s("hh*8").gain("[.2 .12]*4").pan(.5).hpf(800)

$: note("c4 e4 g4 e4").s("supersaw")
  .lpf(2500).resonance(5).release(.2).delay(.4).room(.3).gain(.35)

$: note("<c2 c2 g1 a1>").s("sawtooth")
  .lpf(600).release(.2).gain(.5)
