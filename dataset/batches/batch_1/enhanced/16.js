setcpm(128/4)

$: s("bd ~ bd ~").bank("AkaiLinn").gain(.75)

$: s("~ sd ~ sd").bank("AkaiLinn").gain(.65)

$: s("hh*16").gain("[.16 .1]*8").release(.3).pan(.5)

$: n("0 0 0 0 -4 -5 -3 7").scale("d:minor").s("sawtooth")
  .lpf(3500).release(.15).gain("[.5 .4]*4").pan(.4)

$: n("<d2 d2 bb1 a1>").scale("d:minor").s("square")
  .lpf(700).release(.25).gain(.45)
