setcpm(130/4)

$: s("bd*4").bank("RolandTR909").gain(.85)

$: s("~ cr ~ ~").bank("RolandTR909").gain(.5)

$: s("lt ~ mt*2 lt").hpf(500).lpf(2012).gain(.6).pan(.55)

$: s("hh*8").gain(.18)

$: n("<a1 e2 a1 c2>").scale("a:minor").s("sawtooth")
  .lpf(700).release(.2).gain(.5)
