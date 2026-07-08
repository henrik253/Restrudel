setcpm(128/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("oh*4").gain(.18)

$: s("clave*2 ~ clave ~").gain(.2)

$: note("f4 c4 e4 c4 f4 c4 e4 c4").s("sawtooth").fast(2).lpf(2500).resonance(6).release(.15).delay(.3).gain(.3)

$: note("a3 d5 c#5 c5").s("square").vib(4.5).lpf(2200).release(.2).gain(.35)

$: note("<f1 f1 c2 a1>").s("sawtooth").lpf(650).release(.25).gain(.45)
