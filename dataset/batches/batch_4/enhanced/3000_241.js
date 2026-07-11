setcpm(100)

$: s("mt mt lt lt").gain(.6).lpf(1500).gain(.4)

$: s("hh*8").gain(.2)

$: note("b@2 b b b b@2").clip(1.0011).sustain(0).s("drums lead").velocity(.55).bank("RolandTR909").gain(.8)
