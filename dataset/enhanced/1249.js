setcpm(120/4)

$: s("bd ~ bd ~").bank("RolandTR808").gain(.85)

$: s("~ sn:3 ~ sn:3").gain(.5)

$: s("~ ~ ~ cymbal").gain(.3)

$: note("d5 d#5 d5 a4 d5 c#5 d5 a4").s("sawtooth")
  .attack(.04).lpf(2200).resonance(5).release(.15).delay(.35).gain(.4)

$: note("<d2 d2 a1 c2>").s("square")
  .lpf(600).release(.2).gain(.5)
