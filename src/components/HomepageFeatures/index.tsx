import type {ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import Link from '@docusaurus/Link';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  Svg?: React.ComponentType<React.ComponentProps<'svg'>>;
  image?: string;
  description: ReactNode;
  link?: string;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Life...',
    image: require('@site/static/img/chocolate.png').default,
    description: (
      <>
        以生活的点滴记录时间，从而书写存在的意义。与处处温柔的平淡为伴，也时时期待与发现美好。要记下有感触的事情，留下像巧克力品尝。
      </>
    ),
    link: '/blog',
  },
  {
    title: 'Thoughts?',
    image: require('@site/static/img/desk.png').default,
    description: (
      <>
        以思考反映着外在的世界，从而寻觅自身的价值。思想是一张涂涂改改的草稿纸，每一步进展都是成就感的实现。主观当下的认识有其可爱之处，闪亮的思想火花亦淀积能量。
      </>
    ),
    link: '/thoughts/intro',
  },
  {
    title: 'Projects!',
    image: require('@site/static/img/projecting.png').default,
    description: (
      <>
        项目是表达自己的方式！有趣的项目不仅给自己带来快乐，更有改变世界的潜力。项目的快乐能与热忱的朋友们分享，项目的探索充满开拓的激动。
      </>
    ),
    link: '/docs/intro',
  },
];

function Feature({title, Svg, image, description, link}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className={styles.featureCard}>
        <div className="text--center">
          {Svg && <Svg className={styles.featureSvg} role="img" />}
          {image && <img src={image} className={styles.featureSvg} alt={title} />}
        </div>
        <div className={clsx("text--center padding-horiz--md", styles.featureContent)}>
          <Heading as="h3">{title}</Heading>
          <p>{description}</p>
          {link && (
            <Link to={link} className={styles.featureButton}>
              进入
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
