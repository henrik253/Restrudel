setcpm(118/4)

$: s("bd ~ sd:2 ~").bank("RolandTR909").gain(.85)

$: s("hh*8").gain(.18).pan(.5)

$: n("1 2 3 4 3 2 1 0").scale("d:minor").s("gm_drawbar_organ").release(.3).room(.3).gain(.4)

$: n("-2 7 4 5 3 0").scale("d:minor").s("sawtooth").clip(1).release(.4).gain(.4).delay(.4).hpf(200).lpf(2200).resonance(6)

$: n("<d2 a1 f1 c2>").scale("d:minor").s("square").lpf(600).release(.3).gain(.5)
