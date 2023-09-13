package com.onlyoffice.authorization.configuration.messaging;

import com.onlyoffice.authorization.dto.messages.AuthorizationMessage;
import com.onlyoffice.authorization.dto.messages.ConsentMessage;
import lombok.Getter;
import lombok.Setter;
import org.springframework.amqp.core.AcknowledgeMode;
import org.springframework.amqp.core.AmqpTemplate;
import org.springframework.amqp.rabbit.config.SimpleRabbitListenerContainerFactory;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.rabbit.listener.RabbitListenerContainerFactory;
import org.springframework.amqp.rabbit.listener.SimpleMessageListenerContainer;
import org.springframework.amqp.support.converter.DefaultJackson2JavaTypeMapper;
import org.springframework.amqp.support.converter.Jackson2JavaTypeMapper;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Map;

@Configuration
@ConfigurationProperties(prefix = "messaging.rabbitmq.configuration")
@Getter
@Setter
public class RabbitMQConfiguration {
    private GenericQueueConfiguration authorization;
    private GenericQueueConfiguration consent;
    private int prefetch = 500;
    
    @Bean
    public MessageConverter jsonMessageConverter() {
        Jackson2JsonMessageConverter messageConverter = new Jackson2JsonMessageConverter();
        DefaultJackson2JavaTypeMapper classMapper = new DefaultJackson2JavaTypeMapper();
        classMapper.setTrustedPackages("*");
        classMapper.setIdClassMapping(Map.of(
                "authorization", AuthorizationMessage.class,
                "consent", ConsentMessage.class
        ));
        messageConverter.setClassMapper(classMapper);
        messageConverter.setTypePrecedence(Jackson2JavaTypeMapper.TypePrecedence.TYPE_ID);
        return messageConverter;
    }

    @Bean("rabbitListenerContainerFactory")
    public RabbitListenerContainerFactory<?> rabbitFactory(
            ConnectionFactory connectionFactory,
            MessageConverter converter
    ) {
        var factory = new SimpleRabbitListenerContainerFactory();
        factory.setConnectionFactory(connectionFactory);
        factory.setMessageConverter(converter);
        return factory;
    }

    @Bean("prefetchRabbitListenerContainerFactory")
    public RabbitListenerContainerFactory<SimpleMessageListenerContainer> prefetchRabbitListenerContainerFactory(
            ConnectionFactory rabbitConnectionFactory,
            MessageConverter converter
    ) {
        var factory = new SimpleRabbitListenerContainerFactory();
        factory.setConnectionFactory(rabbitConnectionFactory);
        factory.setMessageConverter(converter);
        factory.setPrefetchCount(prefetch);
        factory.setAcknowledgeMode(AcknowledgeMode.MANUAL);
        return factory;
    }

    public AmqpTemplate rabbitTemplate(
            ConnectionFactory connectionFactory,
            MessageConverter converter
    ) {
        final RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);
        rabbitTemplate.setMessageConverter(converter);
        return rabbitTemplate;
    }
}
