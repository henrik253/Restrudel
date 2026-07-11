setcpm(96/4)

$: s("sd sd").lpf(2053).gain(.4)

$: note("c2 f1 g1 a#1").s("sawtooth").lpf(200).gain(.5).delay(.2).room(.8).hpf(8000)

$: note("g1 a#1").s("triangle").velocity(.15).gain(.3)
