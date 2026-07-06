setcpm(116/4)

$: s("bd ~ bd ~").bank("AkaiLinn").gain(.85)

$: s("~ sd ~ sd").bank("AkaiLinn").gain(.55)

$: s("hh*8").gain("[.2 .13]*4").pan(.5)

$: note("d4 b3 g3 a4").s("sawtooth")
  .lpf(2200).resonance(6).release(.2).delay(.3).room(.4).gain(.4)

$: note("<g1 d2 g2 a1>").s("square").lpf(650).release(.25).gain(.5)
