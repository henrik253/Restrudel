setcpm(128/4)

$: s("bd*2 ~ bd ~").bank("RolandTR909").gain(.82)

$: s("~ sd ~ sd").bank("RolandTR909").gain(.5)

$: s("hh*16").velocity(.79).speed(.9).gain("[.2 .12]*8").pan(.5)

$: note("c4 e4 g4 e4").s("gm_distortion_guitar")
  .lpf(3000).release(.2).room(.3).gain(.35)

$: note("<c2 c2 g1 a1>").s("gm_electric_bass_finger:2")
  .lpf(700).release(.2).gain(.5)
