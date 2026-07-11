setcpm(120/4)

$: s("gm_oboe bd:1 rim sd").bank("Linn9000").gain(.7)

$: s("hh*2 sd").gain(.5).transpose(9).hpf(500).clip(.9).release(.1)

$: note("c2 ~ eb2 g2 bb2 d3 e3").transpose(-12).s("sawtooth").gain(.35)
