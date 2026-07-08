setcpm(120/4)

$: s("cymbal ~ ~ ~ crash ~ ~ ~").room(.2).gain(.3)

$: s("bd!4 ~ sd ~").bank("RolandTR909").gain(.8)

$: s("hh*8").gain(.2)

$: n("4 -2 0 3 ~ -4 -1 1").scale("<bb4:minor a4:lydian>/2").s("sawtooth").gain(.4).hpf(500).lpf(1500)
