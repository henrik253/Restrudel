setcpm(112/4)

$: s("bd!2 bd ~ bd*2 ~ bd ~").bank("RolandTR909").lpf(200).gain(.8)

$: s("~ sd ~ sd").bank("RolandTR909").gain(.55)

$: s("hh*8").gain("[.2 .13]*4").pan(.4)

$: note("c4 e4 g4 e4").s("gm_electric_guitar_clean:2")
  .lpf(4000).release(.1).room(.3).gain(.4)

$: note("<c2 g1 a1 e1>").s("sawtooth")
  .lpf(700).release(.2).gain(.5)
