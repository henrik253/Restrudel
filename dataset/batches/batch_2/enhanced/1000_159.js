setcpm(100/4)
$: s("cp sd").bank("RolandTR909").lpf(3000).hpf(200).gain(.7)
$: note("d#5 d5 c#5 a4").room(.7).s("sawtooth").gain(.4)
$: n("0 3 7 5").scale("C:major").s("sawtooth").lpf(1200).release(.1).gain(.4)
