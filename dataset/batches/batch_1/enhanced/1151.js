setcpm(110/4)

$: s("bd*2 ~ sd ~").bank("RolandTR808").gain(.85)

$: s("hh*8").gain(.18).hpf(200).pan(.4)

$: n("0 3 5 7 5 3 2 0").scale("a:minor").s("gm_acoustic_guitar_steel:2").release(1.5).room(.3).gain(.45)

$: n("<a1 e2 c2 g1>").scale("a:minor").s("sawtooth").lpf(2600).hpf(200).resonance(6).release(.3).gain(.5)

$: n("<a3 c4 e4 g4>").scale("a:minor").s("square").lpf(1800).release(.4).delay(.2).gain(.3)
