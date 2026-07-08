setcpm(100/4)
$: s("cowbell ~").slow(2).gain(.5)
$: s("bd ~ sd ~").bank("RolandTR808").gain(.7)
$: n("c2 ~ f2 ~ -5 ~ -6 -5").s("sawtooth").lpf(800).gain(.4).release(.15)
