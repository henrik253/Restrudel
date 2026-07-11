setcpm(112/4)

$: s("bd ~ bd ~ bd ~ sd ~ bd ~ bd").bank("linn9000").gain(.8)

$: s("hh*8").gain(.18).attack(.001)

$: note("g4 a4 c5 e5").s("gm_oboe").lpf(3000)
  .release(.3).room(.3).gain(.35)

$: note("g2 a2 c3 e3").s("sawtooth").lpf(700)
  .release(.2).gain(.45)
