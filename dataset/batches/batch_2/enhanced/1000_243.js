setcpm(140/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.6)

$: note("c5 g5 eb5 bb5").add(2).lpf(1850).s("sawtooth").gain(.3)

$: s("ocarina").struct("x ~ x ~ x ~ x ~").slow(4).gain(.3)

$: n("0 3 5 ~ 0 3 7").scale("g3:minor").s("sawtooth").gain(.35)

$: s("amen").lpf(2711).slow(4).gain(.4)
