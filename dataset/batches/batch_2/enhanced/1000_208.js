setcpm(112/4)

$: s("bd*2 ~ sd ~").bank("RolandTR909").gain(.8)

$: note("g1 f1 c2 g2").sound("square").lpf(2000).hpf(150).distort("1.2:.6").room(.2).gain(.4)

$: n("1 ~ 2 3 -4 -3").scale("d:dorian").s("sawtooth").lpf(1500).slow(2).gain(.4)
