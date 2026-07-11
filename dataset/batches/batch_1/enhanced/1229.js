setcpm(120/4)

$: s("bd ~ bd ~").bank("RolandTR909").gain(.85)

$: s("~ cowbell:3 ~ ~").gain(.3)

$: s("hh*8").gain("[.2 .12]*4").pan(.4)

$: note("g5 c5 g5 c5").transpose("<0 2 3>").s("vocal")
  .lpf(5000).release(.3).room(.4).gain(.3)

$: note("<g1 g1 c2 e2>").s("sawtooth")
  .lpf(600).release(.2).gain(.5)
