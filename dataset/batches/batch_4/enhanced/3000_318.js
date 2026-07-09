setcpm(110)

$: n("0 1 2 3").transpose("<0 -3 6 3>/16").s("rd 1!3").hpf(400).gain(0.38)
$: s("clavisynth pad").room(.8).hpf(200).gain(.5)
