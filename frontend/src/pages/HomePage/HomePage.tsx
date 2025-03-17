import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Container, 
  Typography, 
  Button, 
  Grid, 
  Card, 
  CardMedia, 
  CardContent, 
  CardActions,
  Box,
  CircularProgress
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

import { fetchEvents } from '@/store/slices/eventSlice';
import { RootState } from '@/store';
import { EventStatus, Event } from '@/types/event';
import { formatDate } from '@/utils/dateUtils';
import styles from './HomePage.module.css';

const HomePage: React.FC = () => {
  const dispatch = useDispatch();
  const { events, loading } = useSelector((state: RootState) => state.events);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);

  useEffect(() => {
    // Загрузка опубликованных событий при монтировании компонента
    dispatch(fetchEvents({ 
      status: EventStatus.PUBLISHED,
      limit: 3
    }) as any);
  }, [dispatch]);

  useEffect(() => {
    // Фильтрация предстоящих событий
    if (events.length > 0) {
      setUpcomingEvents(events.slice(0, 3));
    }
  }, [events]);

  return (
    <div className={styles.homePage}>
      {/* Главный баннер */}
      <Box className={styles.hero}>
        <Container>
          <Box className={styles.heroContent}>
            <Typography variant="h2" component="h1" className={styles.heroTitle}>
              Водный спорт для всех
            </Typography>
            <Typography variant="h5" className={styles.heroSubtitle}>
              Присоединяйтесь к нашему сообществу любителей водного спорта
            </Typography>
            <Box className={styles.heroButtons}>
              <Button 
                variant="contained" 
                color="primary" 
                size="large" 
                component={Link} 
                to="/events"
                className={styles.heroButton}
              >
                Наши события
              </Button>
              <Button 
                variant="outlined" 
                color="primary" 
                size="large" 
                component={Link} 
                to="/register"
                className={styles.heroButton}
              >
                Присоединиться
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Секция с предстоящими событиями */}
      <Container className={styles.eventsSection}>
        <Typography variant="h3" component="h2" className={styles.sectionTitle}>
          Предстоящие события
        </Typography>
        <Typography variant="subtitle1" className={styles.sectionSubtitle}>
          Присоединяйтесь к нашим мероприятиям и станьте частью сообщества
        </Typography>

        {loading ? (
          <Box className={styles.loadingContainer}>
            <CircularProgress />
          </Box>
        ) : upcomingEvents.length > 0 ? (
          <Grid container spacing={4}>
            {upcomingEvents.map((event: Event) => (
              <Grid item xs={12} sm={6} md={4} key={event.id}>
                <Card className={styles.eventCard}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={event.coverImage || '/images/default-event.jpg'}
                    alt={event.title}
                  />
                  <CardContent>
                    <Typography variant="h5" component="h3" className={styles.eventTitle}>
                      {event.title}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" className={styles.eventDate}>
                      <CalendarTodayIcon fontSize="small" style={{ marginRight: 8 }} />
                      {formatDate(event.startDate)}
                    </Typography>
                    {event.location && (
                      <Typography variant="body2" color="textSecondary" className={styles.eventLocation}>
                        <LocationOnIcon fontSize="small" style={{ marginRight: 8 }} />
                        {event.location.city}, {event.location.address}
                      </Typography>
                    )}
                    <Typography variant="body2" className={styles.eventDescription}>
                      {event.shortDescription || event.description.substring(0, 120) + '...'}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button 
                      size="small" 
                      color="primary" 
                      component={Link} 
                      to={`/events/${event.id}`}
                    >
                      Подробнее
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box className={styles.noEventsContainer}>
            <Typography variant="h6">
              В настоящее время нет предстоящих событий
            </Typography>
          </Box>
        )}

        <Box className={styles.viewAllContainer}>
          <Button 
            variant="outlined" 
            color="primary" 
            endIcon={<ArrowForwardIcon />} 
            component={Link} 
            to="/events"
          >
            Все события
          </Button>
        </Box>
      </Container>

      {/* Секция "О нас" */}
      <Box className={styles.aboutSection}>
        <Container>
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box className={styles.aboutImageContainer}>
                <img 
                  src="/images/about-us.jpg" 
                  alt="О нашем клубе" 
                  className={styles.aboutImage}
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h3" component="h2" className={styles.aboutTitle}>
                О нашем клубе
              </Typography>
              <Typography variant="body1" paragraph className={styles.aboutText}>
                Наш клуб водного спорта объединяет любителей активного отдыха на воде. 
                Мы организуем тренировки, соревнования и мероприятия для всех уровней подготовки.
              </Typography>
              <Typography variant="body1" paragraph className={styles.aboutText}>
                Наша миссия — сделать водный спорт доступным для каждого, 
                создать дружное сообщество единомышленников и популяризировать 
                здоровый образ жизни.
              </Typography>
              <Button 
                variant="contained" 
                color="primary" 
                component={Link} 
                to="/about"
                className={styles.aboutButton}
              >
                Узнать больше
              </Button>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Секция с преимуществами */}
      <Container className={styles.featuresSection}>
        <Typography variant="h3" component="h2" className={styles.sectionTitle}>
          Почему выбирают нас
        </Typography>
        <Typography variant="subtitle1" className={styles.sectionSubtitle}>
          Преимущества нашего клуба
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={3}>
            <Box className={styles.featureItem}>
              <Box className={styles.featureIcon}>
                <img src="/icons/community.svg" alt="Сообщество" />
              </Box>
              <Typography variant="h5" component="h3" className={styles.featureTitle}>
                Дружное сообщество
              </Typography>
              <Typography variant="body2" className={styles.featureText}>
                Присоединяйтесь к единомышленникам, разделяющим вашу страсть к водному спорту
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box className={styles.featureItem}>
              <Box className={styles.featureIcon}>
                <img src="/icons/training.svg" alt="Тренировки" />
              </Box>
              <Typography variant="h5" component="h3" className={styles.featureTitle}>
                Профессиональные тренеры
              </Typography>
              <Typography variant="body2" className={styles.featureText}>
                Наши тренеры имеют многолетний опыт и помогут вам достичь новых высот
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box className={styles.featureItem}>
              <Box className={styles.featureIcon}>
                <img src="/icons/equipment.svg" alt="Оборудование" />
              </Box>
              <Typography variant="h5" component="h3" className={styles.featureTitle}>
                Современное оборудование
              </Typography>
              <Typography variant="body2" className={styles.featureText}>
                Мы используем только качественное и безопасное оборудование для тренировок
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box className={styles.featureItem}>
              <Box className={styles.featureIcon}>
                <img src="/icons/events.svg" alt="События" />
              </Box>
              <Typography variant="h5" component="h3" className={styles.featureTitle}>
                Регулярные мероприятия
              </Typography>
              <Typography variant="body2" className={styles.featureText}>
                Участвуйте в соревнованиях, мастер-классах и других интересных событиях
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Секция призыва к действию */}
      <Box className={styles.ctaSection}>
        <Container>
          <Typography variant="h3" component="h2" className={styles.ctaTitle}>
            Готовы присоединиться к нам?
          </Typography>
          <Typography variant="h6" className={styles.ctaText}>
            Станьте частью нашего сообщества уже сегодня и откройте для себя мир водного спорта
          </Typography>
          <Box className={styles.ctaButtons}>
            <Button 
              variant="contained" 
              color="secondary" 
              size="large" 
              component={Link} 
              to="/register"
              className={styles.ctaButton}
            >
              Зарегистрироваться
            </Button>
            <Button 
              variant="outlined" 
              color="secondary" 
              size="large" 
              component={Link} 
              to="/contact"
              className={styles.ctaButton}
            >
              Связаться с нами
            </Button>
          </Box>
        </Container>
      </Box>
    </div>
  );
};

export default HomePage; 