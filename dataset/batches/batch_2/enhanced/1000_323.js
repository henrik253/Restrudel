setcpm(100/4)

$: s("bd sd").slow(2).gain(.7)

$: note("d2*8 g#3@2 e3@4 b2@3").s("sawtooth").lpf(3528).gain(.35)

$: note("g5 e5 c5 d5").s("sawtooth").lpf(1000).room(.6194).gain(.4).hpf(200)
