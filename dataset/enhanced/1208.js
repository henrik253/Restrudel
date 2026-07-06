setcpm(116/4)

$: s("~ ~ bd ~").bank("RolandTR808").gain(.85)

$: s("~ sd ~ sd").bank("RolandTR808").gain(.5)

$: s("hh*8").gain("[.2 .12]*4").pan(.4)

$: note("c3 e3 g3 e3").s("pulse")
  .lpf(1800).resonance(5).release(.15).delay(.4).gain(.4)

$: note("c2 c2 eb2 c2").s("sawtooth")
  .lpf(600).gain("0.4 0.6 0.5 0.7").release(.2)
