setcpm(90/4)
$: s("bd ~ sd ~").bank("RolandTR909").gain(.8)
$: note("c3 eb3").add("<0 .12>").transpose("<0 1 2 1>/8").s("sawtooth").gain(.4).lpf(1200)
$: s("sleighbells ~").slow(2).gain(.2)
