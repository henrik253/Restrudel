setcpm(112/4)

$: s("bd ~ bd ~").bank("RolandTR909").gain(.85)

$: s("~ sd ~ sd").bank("RolandTR909").gain(.7)

$: s("~ rd ~ rd*3").gain(.2).pan(.6)

$: n("<c2 c2 g1 bb1> ~ eb2 ~").scale("c:minor").s("gm_tuba")
  .attack(.018).release(.2).clip(.5).gain(.5)

$: n("0 3 5 7").scale("c:minor").s("sawtooth")
  .lpf(1600).release(.15).delay(.4).gain(.35)
