setcpm(116/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("cowbell ~ ~ cowbell").clip(.9).release(.1).pan(.3).gain(.3)

$: s("hh*8").gain("[.2 .12]*4").pan(.45)

$: note("c4 e4 g4 e4").s("gm_acoustic_guitar_steel:2")
  .hpf(1000).attack(.05).release(.5).room(.3).gain(.4)

$: note("<c2 c2 g1 a1>").s("sawtooth")
  .lpf(600).release(.2).gain(.5)
